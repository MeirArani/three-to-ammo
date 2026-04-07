import { ShapeType } from "../test/index.test";

declare module "@hubs/ammo.js" 
{ 
    interface btCollisionShape {
        //type?: ShapeType
        destroy: () => void;
        resources?: any[] | any;
        heightfieldData?: number;
        localTransform: btTransform;
    }
}