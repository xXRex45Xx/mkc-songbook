import { describe, expect, it } from "@jest/globals";
import Joi from "joi";

import { ClientFaultError, ServerFaultError } from "../../utils/error.util.js";
import validateSchema from "../../utils/validator.util.js";

describe("validateSchema", () => {
  it("should resolve when the payload matches the schema", async () => {
    const schema = Joi.object({
      name: Joi.string().required(),
    }).required();

    await expect(validateSchema({ name: "MKC" }, schema)).resolves.toBeUndefined();
  });

  it("should throw ClientFaultError with Joi validation messages", async () => {
    const schema = Joi.object({
      name: Joi.string().min(3).required(),
      age: Joi.number().min(18).required(),
    }).required();

    await expect(validateSchema({ name: "Al", age: 10 }, schema)).rejects.toThrow(
      ClientFaultError,
    );

    await expect(validateSchema({ name: "Al", age: 10 }, schema)).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("length must be at least 3 characters long"),
    });
  });

  it("should throw ServerFaultError for unexpected validator failures", async () => {
    const schema = {
      validateAsync: async () => {
        throw new Error("validator exploded");
      },
    };

    await expect(validateSchema({ name: "MKC" }, schema)).rejects.toThrow(ServerFaultError);
  });
});
