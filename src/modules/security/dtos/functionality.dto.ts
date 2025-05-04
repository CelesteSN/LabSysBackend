import {Functionality} from "../models/functionality.model";

export default class FunctionalityDto {
    functionalityName: string;
    
   

    constructor( functionality: Functionality) {
        this.functionalityName = Functionality.name;
        

    }
}