import NumberMiddleware from '../middlewares/number.middleware';

describe('Number Middleware', () => {
    describe('Test isNumber', () => {
        test('should return 400 if id is not provided', () => {
            const req = {
                params: {}
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            NumberMiddleware.isNumber(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'ID is required'
            });
        });
        test('should return 400 if id is not a number', () => {
            const req = {
                params: {
                    id: 'Falso ID'
                }
            };
            const res = {
                status: jest.fn().mockReturnThis(),
                json: jest.fn()
            };
            const next = jest.fn();
            NumberMiddleware.isNumber(req, res, next);
            expect(res.status).toHaveBeenCalledWith(400);
            expect(res.json).toHaveBeenCalledWith({
                message: 'El ID debe ser un numero'
            });
        });
        test('should call next()', () => {
            const req = {
                params: {
                    id: 1
                }
            };
            const res= jest.fn();
            const next = jest.fn();
            NumberMiddleware.isNumber(req, res, next);
            expect(next).toHaveBeenCalled();
        });
    });
});