import { Request, Response } from "express"
import { resolve } from 'path';
import { getCustomRepository } from "typeorm"
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
      return response.status(400).json({
        error: "User does not exist"
      })
    }

    const survey = await surveysRepository.findOne({id: survey_id})
    
    if(!survey) {
      return response.status(400).json({
        error: "Survey does not exist!"
      })
    }
    
    const variables = {
      name: user.name,
      title: survey.title,
      description: survey.description,
      user_id: user.id,
      link: process.env.URL_MAIL
    }

    const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs")

    const surveyAlreadyExists = await surveysUsersRepository.findOne({
      where: [{user_id: user.id},{value: null}],
      relations: ["user", "survey"]
    })

    if(surveyAlreadyExists) {
      await SendMailService.execute(email, survey.title, variables, npsPath)
      return response.json(surveyAlreadyExists)
    }

    const surveyUser = surveysUsersRepository.create({
      user_id: user.id,
      survey_id
    })
    
    await surveysUsersRepository.save(surveyUser)
    
    await SendMailService.execute(email, survey.title, variables, npsPath)

    return response.json(surveyUser)
  }
}
export { SendEmailController }