import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

router.get('/fetchAllUsers', async (req, res) => {
    const result = await UserService.getAllUsers();
    res.status(result.code).json(result.message);
});

router.get('/searchUsers', async (req, res) => {
    const result = await UserService.findUsers(req.query);
    res.status(result.code).json(result.message);
});

router.post('/addUser', async (req, res) => {
    const result = await UserService.createUser(req);
    res.status(result.code).json(result.message);
});

router.post('/massAddUsers', async (req, res) => {
    const result = await UserService.bulkCreateUsers(req);
    res.status(result.code).json(result.message);
});

router.get(
    '/user/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const result = await UserService.getUserById(req.params.id);
        res.status(result.code).json(result.message);
    }
);

router.put(
    '/user/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const result = await UserService.updateUser(req);
        res.status(result.code).json(result.message);
    }
);

router.delete(
    '/user/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const result = await UserService.deleteUser(req.params.id);
        res.status(result.code).json(result.message);
    }
);

export default router;
