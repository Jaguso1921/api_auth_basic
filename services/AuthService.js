import bcrypt from 'bcrypt';
import db from '../dist/db/models/index.js';

const signIn = async (email, password) => {
    const user = await db.User.findOne({
        where: { email: email }
    });

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return {
            code: 401,
            message: 'Unauthorized access'
        };
    }

    const expiryTime = (new Date()).setHours((new Date()).getHours() + 1);

    const authToken = Buffer.from(JSON.stringify({
        name: user.name,
        email: user.email,
        id: user.id,
        roles: ['User'],
        expiration: expiryTime,
    })).toString('base64');

    const newSession = {
        id_user: user.id,
        token: authToken,
        expiration: expiryTime,
    };

    await db.Session.create(newSession);

    return {
        code: 200,
        message: authToken
    };
};

const signOut = async (token) => {
    const session = await db.Session.findOne({
        where: { token: token }
    });

    session.expiration = new Date();
    await session.save();

    return {
        code: 200,
        message: 'Logged out successfully'
    };
};

export default {
    signIn,
    signOut,
};
