import AuthService from '../services/AuthService';
import db from '../dist/db/models/index.js';
import bcrypt from 'bcrypt';

jest.mock('../dist/db/models/index.js');
jest.mock('bcrypt');
describe('Testing AuthService', () => {
    let mockSessionFindOne = jest.fn();
    let mockSessionCreate = jest.fn();
    let mockUserFindOne = jest.fn();
    let mockBcrypt = jest.fn();

    beforeAll(() => {
        db.Session.findOne = mockSessionFindOne;
        db.Session.create = mockSessionCreate;
        db.User.findOne = mockUserFindOne;
        bcrypt.compareSync = mockBcrypt;
    });

    describe('Test logout()', () => {
       test('logout should return 200 code', async () => {
           mockSessionFindOne.mockResolvedValue({
                expiration: '',
                save: () => {}
            });
            expect(await AuthService.logout('fakeToken')).toStrictEqual({
                code: 200,
                message: 'Usuario Desconectado',
            });
       });
    });
    describe('Test login()', () => {
       test('login should return 401 code with email not exist', async () => {
           mockUserFindOne.mockResolvedValue(null);
           expect(await AuthService.login('fakeEmail', 'fakePassword')).toStrictEqual({
               code: 401,
               message: 'Sin autorizacion',
           });
       });
        test('login should return 401 code with wrong password', async () => {
            mockUserFindOne.mockResolvedValue({
                password: 'fakePassword two',
            });
            expect(await AuthService.login('fakeEmail', 'fakePassword')).toStrictEqual({
                code: 401,
                message: 'Sin autorizacion',
            });
        });
        test('login should return 200 code', async () => {
            mockUserFindOne.mockResolvedValue(({
                name: 'Nombre Falso o no existe',
                email: 'Email Falso o no existe',
                id: 1,
                password: 'Contraseña falsa o no existe',
            }));
            mockBcrypt.mockResolvedValue(true);
            expect(await AuthService.login('fakeEmail', 'fakePassword')).toStrictEqual({
                code: 200,
                message: expect.any(String),
            });
        })
    });
});