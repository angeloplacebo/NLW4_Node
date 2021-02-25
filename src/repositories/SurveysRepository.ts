import { EntityRepository } from "typeorm";
import { Repository } from "typeorm/repository/Repository";
import { Survey } from "../models/Survey";

@EntityRepository(Survey)
class SurveysRepository extends Repository<Survey> {

}

export { SurveysRepository }