import createTypedHandler from "./typedHandler";

const typedHandler = createTypedHandler({
    onMissingBody: (req, res, next) => {
        res.status(400).send("Missing request body!")
    },
    onMissingFields: (keys, req, res, next) => {
        res.status(400).send(`Missing fields: ${keys.join(", ")}`)
        // e.g. `Missing fields: username, password`
    },
    onMismatchedTypes: (fields, req, res, next) => {
        res.status(400).send(`Fields with mismatched types: ${fields.map(([key, type]) => `${key}/${type}`).join(", ")}`)
        // e.g. `Fields with mismatched types: username/string, password/string, age/number`
    }
})

// types the req.body
type CreateUserBody = {
    username: string
    password: string
    age: number
}

// (schema: Record<string, T>, handler: RequestHandler) where T is...
// "string" | "boolean" | "number" | "array" | "object" | "null" | "string?" | etc...  
const createUserMiddlware = typedHandler<CreateUserBody>({ 
    username: "string",
    password: "string"
}, (req, res) => {
    // middleware that is called after body validation
})