import { RequestHandler, Request, Response, NextFunction } from 'express'
import * as core from "express-serve-static-core"

const isType = (val: any, type: string): boolean => {
    switch (type) {
        case "string":
        case "number":
        case "boolean": {
            return typeof val === type
        }

        case "null": {
            return val === null
        }

        case "array": {
            return Array.isArray(val)
        }

        case "object": {
            return !Array.isArray(val) && (typeof val === "object")
        }

        default: {
            return false
        }
    }
}

const fieldIsValid = (body: Record<string, any>, key: string, bt: BodyType): boolean => {
    if (bt.endsWith("?")) bt = bt.replace("?", "") as BodyType;
    return isType(body[key], bt);
}

const fieldExists = (body: Record<string, any>, key: string, bt: BodyType): boolean => {
    if (bt.endsWith("?")) true;
    return body[key] !== undefined;
}

type BodyType = (
    | "string"
    | "string?"
    | "number"
    | "number?"
    | "boolean"
    | "boolean?"
    | "array"
    | "array?"
    | "object"
    | "object?"
    | "null"
    | "null?"
)

type TypedHandlerSchema = Record<string, BodyType>

type TypedHandlerFn = <T extends Record<string, any>>(schema: TypedHandlerSchema, then: TypedHandler<T>) => TypedHandler<T>
type TypedHandler<T extends Record<string, any>> = RequestHandler<core.ParamsDictionary, any, T>

type TypedHandlerHooks = {
    onMissingBody: RequestHandler
    onMissingFields: (keys: string[], req: Request, res: Response, next: NextFunction) => void
    onMismatchedTypes: (keys: [string, string][], req: Request, res: Response, next: NextFunction) => void
}


const createTypedHandler = (hooks: TypedHandlerHooks): TypedHandlerFn => {
    const typedHandler: TypedHandlerFn = (schema, then) => {
        return (req, res, next) => {
            // Validate: req.body is object literal
            if (typeof req.body !== "object" || !Array.isArray(req.body)) return hooks.onMissingBody(req, res, next);

            // Validate: req.body is valid
            const missingFields: string[] = [];
            const mismatchedTypes: [string, string][] = [];
            Object.keys(req.body).forEach((k) => {
                const bt = schema[k];
                if (!fieldExists(req.body, k, bt)) {
                    missingFields.push(k)
                }
                if (!fieldIsValid(req.body, k, bt)) {
                    mismatchedTypes.push([k, bt])
                }
            })
            
            if (missingFields.length > 0) return hooks.onMissingFields(missingFields, req, res, next);
            if (mismatchedTypes.length > 0) return hooks.onMismatchedTypes(mismatchedTypes, req, res, next);
    
            then(req, res, next)
        }
    }
    return typedHandler
}


export default createTypedHandler