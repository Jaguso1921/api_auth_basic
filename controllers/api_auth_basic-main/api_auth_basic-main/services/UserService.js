import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';

const createUser = async (req) => {
    const {
        name,
        email,
        password,
        password_second,
        cellphone
    } = req.body;
    if (password !== password_second) {
        return {
            code: 400,
            message: 'Las contraseñas no coinciden entre si'
        };
    }
    const user = await db.User.findOne({
        where: {
            email: email
        }
    });
    if (user) {
        return {
            code: 400,
            message: 'Usuario ya existe o ya creado'
        };
    }

    const encryptedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: encryptedPassword,
        cellphone,
        status: true
    });
    return {
        code: 200,
        message: 'El usuario fue creado exitosamente con el ID: ' + newUser.id,
    }
};

const getUserById = async (id) => {
    return {
        code: 200,
        message: await db.User.findOne({
            where: {
                id: id,
                status: true,
            }
        })
    };
}

const updateUser = async (req) => {
    const user = db.User.findOne({
        where: {
            id: req.params.id,
            status: true,
        }
    });
    const payload = {};
    payload.name = req.body.name ?? user.name;
    payload.password = req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password;
    payload.cellphone = req.body.cellphone ?? user.cellphone;
    await db.User.update(payload, {
        where: {
            id: req.params.id
        }

    });
    return {
        code: 200,
        message: 'El usuario fue eliminado correctamente'
    };
}

const deleteUser = async (id) => {
    /* await db.User.destroy({
        where: {
            id: id
        }
    }); */
    const user = db.User.findOne({
        where: {
            id: id,
            status: true,
        }
    });
    await  db.User.update({
        status: false
    }, {
        where: {
            id: id
        }
    });
    return {
        code: 200,
        message: 'Usuario eliminado correctamente'
    };
}

const getAllUsers = async () => {
    const users = await db.User.findAll({
        where: {
            status: true,
        },
        attributes: { exclude: ['Contraseña'] }
    });
    return {
        code: 200,
        message: users,
    };
};

const findUsers = async (filters) => {
    const { name, deleted, loginAntes, loginDespues } = filters;
    const whereClause = {};

    if (deleted !== undefined) { 
        whereClause.status = deleted === 'true' ? false : true;

    } /* Busca los registros en el caso de 'deleted' es 'true',
      de lo contrario, busca aquellos que son activos.*/
    if (name) {
        whereClause.name = {
            [db.Sequelize.Op.like]: `%${name}%`
        };
    } /* Construye una consulta dinámica para la busqueda de los usuarios
     Con filtros*/
    if (loginAntes) {
        whereClause.createdAt = {
            [db.Sequelize.Op.lte]: new Date(loginAntes)
        };

    } /*filtra los usuarios creados
    antes de una fecha que sea especifica*/
    if (loginDespues) {
        whereClause.createdAt = {
            [db.Sequelize.Op.gte]: new Date(loginDespues)
        };

    } /*filtra los usuarios creados
     despues de una fecha que sea especifica*/

    const users = await db.User.findAll({
        where: whereClause,
        attributes: { exclude: ['Contraseña'] }
    });
    return {
        code: 200,
        message: users,
    };
};

const bulkCreateUsers = async (req) => {
    const users = req.body;
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {

        const { name, email, password, password_second, cellphone } = user;
        
        if (password !== password_second) {
            failureCount++;
            continue;
        }

        const existingUser = await db.User.findOne({
            where: {
                email: email
            }
        });

        if (existingUser) {
            failureCount++;
            continue;
        }

        const encryptedPassword = await bcrypt.hash(password, 10);

        try {
            await db.User.create({
                name,
                email,
                password: encryptedPassword,
                cellphone,
                status: true
            });
            successCount++;
        } catch (error) {
            failureCount++;
        }
    }

    return {
        code: 200,
        message: `Usuarios Creados exitosamente: ${successCount}, Usuarios no fueron creados exitosamente: ${failureCount}`
    };
};

export default {
    createUser,
    getUserById,
    updateUser,
    deleteUser,
    getAllUsers,
    findUsers,
    bulkCreateUsers,
}