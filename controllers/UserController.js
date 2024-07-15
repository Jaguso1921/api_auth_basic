import { Router } from 'express';
import UserService from '../services/UserService.js';
import NumberMiddleware from '../middlewares/number.middleware.js';
import UserMiddleware from '../middlewares/user.middleware.js';
import AuthMiddleware from '../middlewares/auth.middleware.js';

const router = Router();

// Endpoint para obtener todos los usuarios
router.get('/getAllUsers', async (req, res) => {
    const response = await UserService.getAllUsers();
    res.status(response.code).json(response.message);
});

// Endpoint para buscar usuarios con filtros
router.get('/findUsers', async (req, res) => {
    const response = await UserService.findUsers(req.query);
    res.status(response.code).json(response.message);
});

// Endpoint para crear un usuario
router.post('/create', async (req, res) => {
    const response = await UserService.createUser(req);
    res.status(response.code).json(response.message);
});

// Endpoint para crear usuarios en masa
router.post('/bulkCreate', async (req, res) => {
    const response = await UserService.bulkCreateUsers(req);
    res.status(response.code).json(response.message);
});

// Endpoint para obtener un usuario por ID
router.get(
    '/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions
    ],
    async (req, res) => {
        const response = await UserService.getUserById(req.params.id);
        res.status(response.code).json(response.message);
});

// Endpoint para actualizar un usuario por ID
router.put('/:id', [
    NumberMiddleware.isNumber,
    UserMiddleware.isValidUserById,
    AuthMiddleware.validateToken,
    UserMiddleware.hasPermissions,
],
async(req, res) => {
    const response = await UserService.updateUser(req);
    res.status(response.code).json(response.message);
});

// Endpoint para eliminar un usuario por ID
router.delete('/:id',
    [
        NumberMiddleware.isNumber,
        UserMiddleware.isValidUserById,
        AuthMiddleware.validateToken,
        UserMiddleware.hasPermissions,
    ],
    async (req, res) => {
       const response = await UserService.deleteUser(req.params.id);
       res.status(response.code).json(response.message);
});

export default router;
