import bcrypt from 'bcrypt';
import db from '../dist/db/models/index.js';

const registerUser = async (req) => {
    const { name, email, password, password_second, cellphone } = req.body;

    if (password !== password_second) {
        return {
            code: 400,
            message: 'Passwords do not match'
        };
    }

    const existingUser = await db.User.findOne({ where: { email: email } });

    if (existingUser) {
        return {
            code: 400,
            message: 'User already exists'
        };
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await db.User.create({
        name,
        email,
        password: hashedPassword,
        cellphone,
        status: true
    });

    return {
        code: 200,
        message: 'User successfully created with ID: ' + newUser.id
    };
};

const retrieveUserById = async (id) => {
    const user = await db.User.findOne({
        where: { id: id, status: true }
    });
    return {
        code: 200,
        message: user
    };
};

const modifyUser = async (req) => {
    const user = await db.User.findOne({
        where: { id: req.params.id, status: true }
    });

    const updates = {
        name: req.body.name ?? user.name,
        password: req.body.password ? await bcrypt.hash(req.body.password, 10) : user.password,
        cellphone: req.body.cellphone ?? user.cellphone
    };

    await db.User.update(updates, { where: { id: req.params.id } });

    return {
        code: 200,
        message: 'User successfully updated'
    };
};

const removeUser = async (id) => {
    const user = await db.User.findOne({
        where: { id: id, status: true }
    });

    await db.User.update({ status: false }, { where: { id: id } });

    return {
        code: 200,
        message: 'User successfully deleted'
    };
};

const listAllUsers = async () => {
    const users = await db.User.findAll({
        where: { status: true },
        attributes: { exclude: ['password'] }
    });
    return {
        code: 200,
        message: users
    };
};

const searchUsers = async (filters) => {
    const { name, deleted, loginAntes, loginDespues } = filters;
    const whereClause = {};

    if (deleted !== undefined) {
        whereClause.status = deleted === 'true' ? false : true;
    }

    if (name) {
        whereClause.name = { [db.Sequelize.Op.like]: `%${name}%` };
    }

    if (loginAntes) {
        whereClause.createdAt = { [db.Sequelize.Op.lte]: new Date(loginAntes) };
    }

    if (loginDespues) {
        whereClause.createdAt = { [db.Sequelize.Op.gte]: new Date(loginDespues) };
    }

    const users = await db.User.findAll({
        where: whereClause,
        attributes: { exclude: ['password'] }
    });

    return {
        code: 200,
        message: users
    };
};

const batchCreateUsers = async (req) => {
    const users = req.body;
    let successCount = 0;
    let failureCount = 0;

    for (const user of users) {
        const { name, email, password, password_second, cellphone } = user;

        if (password !== password_second) {
            failureCount++;
            continue;
        }

        const existingUser = await db.User.findOne({ where: { email: email } });

        if (existingUser) {
            failureCount++;
            continue;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        try {
            await db.User.create({
                name,
                email,
                password: hashedPassword,
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
        message: `Successfully created users: ${successCount}, Failed to create users: ${failureCount}`
    };
};

export default {
    registerUser,
    retrieveUserById,
    modifyUser,
    removeUser,
    listAllUsers,
    searchUsers,
    batchCreateUsers
};
