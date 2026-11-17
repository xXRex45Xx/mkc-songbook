jest.mock("passport", () => {
  const authenticate = jest.fn((strategy, options, callback) => {
    callback(null, {});
    return (req, res, next) => {};
  });
  return {
    authenticate,
    use: jest.fn(),
  };
});
jest.mock("../../utils/session.util.js");
jest.mock("../../middlewares/login-risk.middleware.js");

import localAuth from "../../middlewares/local-auth.middleware.js";
import * as passport from "passport";
import { issueSession } from "../../utils/session.util.js";
import { ClientFaultError, ServerFaultError } from "../../utils/error.util.js";

const flushPromises = () => new Promise((resolve) => setImmediate(resolve));

describe("localAuth middleware", () => {
	beforeEach(() => {
		jest.clearAllMocks();
		process.env.JWT_SECRET = "test-secret-key";
		issueSession.mockResolvedValue();
	});

	describe("successful authentication", () => {
		it("should authenticate user and start a cookie session", async () => {
			const mockUser = {
				_id: "user123",
				name: "Test User",
				email: "test@example.com",
				role: "member",
			};
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(null);
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});

			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(passport.authenticate).toHaveBeenCalledWith(
				"local",
				{},
				expect.any(Function),
			);
			expect(mockReq.login).toHaveBeenCalledWith(
				mockUser,
				{ session: false },
				expect.any(Function),
			);
			expect(issueSession).toHaveBeenCalledWith(mockRes, mockUser);
			expect(mockRes.status).toHaveBeenCalledWith(200);
			expect(mockRes.json).toHaveBeenCalledWith({
				user: {
					id: mockUser._id,
					name: mockUser.name,
					email: mockUser.email,
					role: mockUser.role,
				},
			});
			expect(mockNext).not.toHaveBeenCalled();
		});

		it("should start the session for the authenticated user", async () => {
			const mockUser = {
				_id: "unique-user-id",
				name: "John Doe",
				email: "john@example.com",
				role: "admin",
			};
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(null);
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});


			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(issueSession).toHaveBeenCalledWith(mockRes, mockUser);
		});

		it("should return user object with all required fields", async () => {
			const mockUser = {
				_id: "user456",
				name: "Jane Smith",
				email: "jane@example.com",
				role: "super-admin",
			};
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(null);
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});


			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			const expectedUser = {
				id: mockUser._id,
				name: mockUser.name,
				email: mockUser.email,
				role: mockUser.role,
			};

			expect(mockRes.json).toHaveBeenCalledWith({
				user: expectedUser,
			});
		});
	});

	describe("authentication failures", () => {
		it("should call next with ClientFaultError when user not found", async () => {
			const mockReq = {
				login: jest.fn(),
			};
			const mockRes = {
				status: jest.fn(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, false);
				return (req, res, next) => {};
			});

			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockNext).toHaveBeenCalledTimes(1);
			const error = mockNext.mock.calls[0][0];
			expect(error).toBeInstanceOf(ClientFaultError);
			expect(error.message).toBe("Invalid username or password.");
		});

		it("should call next with ServerFaultError when login fails", async () => {
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(new Error("Login failed"));
				}),
			};
			const mockRes = {
				status: jest.fn(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, { _id: "user123" });
				return (req, res, next) => {};
			});

			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockNext).toHaveBeenCalledTimes(1);
			const error = mockNext.mock.calls[0][0];
			expect(error).toBeInstanceOf(ServerFaultError);
		});

		it("should call next with ServerFaultError when passport throws error", async () => {
			const mockReq = {
				login: jest.fn(),
			};
			const mockRes = {
				status: jest.fn(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			const passportError = new Error("Passport error");
			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(passportError, null);
				return (req, res, next) => {};
			});

			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockNext).toHaveBeenCalledTimes(1);
			const error = mockNext.mock.calls[0][0];
			expect(error).toBeInstanceOf(ServerFaultError);
		});

		it("should handle passport authenticate returning undefined user", async () => {
			const mockReq = {
				login: jest.fn(),
			};
			const mockRes = {
				status: jest.fn(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, undefined);
				return (req, res, next) => {};
			});

			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockNext).toHaveBeenCalledTimes(1);
			const error = mockNext.mock.calls[0][0];
			expect(error).toBeInstanceOf(ClientFaultError);
		});
	});

	describe("error handling", () => {
		it("should handle JWT signing errors", async () => {
			const mockUser = {
				_id: "user123",
				name: "Test User",
				email: "test@example.com",
				role: "member",
			};
			const jwtError = new Error("JWT signing failed");
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(null);
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});

			issueSession.mockRejectedValue(jwtError);

			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockNext).toHaveBeenCalledTimes(1);
			const error = mockNext.mock.calls[0][0];
			expect(error).toBeInstanceOf(ServerFaultError);
		});

		it("should handle login callback errors gracefully", async () => {
			const mockUser = {
				_id: "user123",
				name: "Test User",
				email: "test@example.com",
				role: "member",
			};
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(new ServerFaultError(new Error("Session error")));
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});


			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockNext).toHaveBeenCalledTimes(1);
			const error = mockNext.mock.calls[0][0];
			expect(error).toBeInstanceOf(ServerFaultError);
		});
	});

	describe("edge cases", () => {
		it("should handle user with special characters in name", async () => {
			const mockUser = {
				_id: "user123",
				name: "José García-O'Brien",
				email: "jose@example.com",
				role: "member",
			};
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(null);
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});


			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					user: expect.objectContaining({
						name: "José García-O'Brien",
					}),
				}),
			);
		});

		it("should handle user with empty string role", async () => {
			const mockUser = {
				_id: "user123",
				name: "Test User",
				email: "test@example.com",
				role: "",
			};
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(null);
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});


			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockRes.json).toHaveBeenCalledWith(
				expect.objectContaining({
					user: expect.objectContaining({
						role: "",
					}),
				}),
			);
		});

		it("should not call next() on successful authentication", async () => {
			const mockUser = {
				_id: "user123",
				name: "Test User",
				email: "test@example.com",
				role: "member",
			};
			const mockReq = {
				login: jest.fn((user, options, callback) => {
					callback(null);
				}),
			};
			const mockRes = {
				status: jest.fn().mockReturnThis(),
				json: jest.fn(),
			};
			const mockNext = jest.fn();

			passport.authenticate.mockImplementation((strategy, options, callback) => {
				callback(null, mockUser);
				return (req, res, next) => {};
			});


			await localAuth(mockReq, mockRes, mockNext);
			await flushPromises();

			expect(mockNext).not.toHaveBeenCalled();
		});
	});
});
