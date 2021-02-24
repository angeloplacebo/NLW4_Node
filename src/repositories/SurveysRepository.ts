import { EntityRepository } from "typeorm";
import { Repository } from "typeorm/repository/Repository";
import { Surveys } from "../models/Surveys";

@EntityRepository(Surveys)
class SurveysRepository extends Repository<Surveys> {

}

export { SurveysRepository }