import request from 'supertest'
import { app } from '../app'

describe("Users", () => {

  request(app).get("/users")
  .send({
    email: "user@example.com",
    name:"User Example"
  })
})