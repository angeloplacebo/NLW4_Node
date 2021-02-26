import { Request, Response } from "express"
import { resolve } from 'path';
import { getCustomRepository } from "typeorm"
import { AppError } from "../errors/AppError";
import { SurveysRepository } from "../repositories/SurveysRepository"
import { SurveysUserRepository } from "../repositories/SurveysUserRepository"
import { UsersRepository } from "../repositories/UsersRepository"
import SendMailService from "../services/SendMailService"

class SendEmailController {

  async execute(request: Request, response: Response){
    const { email, survey_id } = request.body

    const usersRepository = await getCustomRepository(UsersRepository)
    const surveysRepository = await getCustomRepository(SurveysRepository)
    const surveysUsersRepository = await getCustomRepository(SurveysUserRepository)

    const user = await usersRepository.findOne({ email})

    if (!user){
      throw new AppError("User does not exist");
      // return response.status(400).json({
      //   error: "User does not exist"
      // })
    }

    const survey = await surveysRepository.findOne({id: survey_id})
    
    if(!survey) {
      throw new AppError("Survey does not exist");
      // return response.status(400).json({
      //   error: "Survey does not exist!"
      // })
    }
    
    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs")
    
    const surveyAlreadyExists = await surveysUsersRepository.findOne({
      where: {user_id: user.id , value: null},
      relations: ["user", "survey"]
    })
    
    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      id: "",
      link: process.env.URL_MAIL
    }

    if(surveyAlreadyExists) {
      variables.id = surveyAlreadyExists.id
      await SendMailService.execute(email, survey.title, variables, npsPath)
      return response.json(surveyAlreadyExists)
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    })
    
    await surveysUsersRepository.save(surveyUser)

    variables.id = surveyUser.id
    
    await SendMailService.execute(email, survey.title, variables, npsPath)

    return response.json(surveyUser)
  }
}
export { SendEmailController }