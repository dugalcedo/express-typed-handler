import createTypedHandler from "./typedHandler";

const typedHandler = createTypedHandler({
    onMissingBody: () => {},
    onMissingFields: () => {},
    onMismatchedTypes: () => {}
})

type CreateUserBody = {
    username: string
    password: string
    age: number
}

const createUserMiddlware = typedHandler<CreateUserBody>({
    username: "string",
    password: "string"
}, (req, res) => {
    
})