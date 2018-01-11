import { JSORMBase, ModelConfiguration } from "./model";
import { AttributeOptions } from "./attribute";
import { AssociationFactoryOpts } from "./associations";
declare type ModelDecorator = <M extends typeof JSORMBase>(target: M) => M;
declare const ModelDecorator: (config?: Partial<ModelConfiguration> | undefined) => ModelDecorator;
export declare const initModel: (modelClass: typeof JSORMBase, config?: Partial<ModelConfiguration> | undefined) => void;
declare const AttrDecoratorFactory: {
    (config?: AttributeOptions): PropertyDecorator;
    (target: JSORMBase, propertyKey: string): void;
    (target: typeof JSORMBase, propertyKey: string, config?: AttributeOptions): void;
};
declare const HasManyDecoratorFactory: {
    (optsOrType?: string | typeof JSORMBase | AssociationFactoryOpts<JSORMBase> | undefined): (target: JSORMBase, propertyKey: string) => void;
    (target: typeof JSORMBase, propertyKey: string, optsOrType?: string | AssociationFactoryOpts<JSORMBase> | undefined): void;
};
declare const HasOneDecoratorFactory: {
    (optsOrType?: string | typeof JSORMBase | AssociationFactoryOpts<JSORMBase> | undefined): (target: JSORMBase, propertyKey: string) => void;
    (target: typeof JSORMBase, propertyKey: string, optsOrType?: string | AssociationFactoryOpts<JSORMBase> | undefined): void;
};
declare const BelongsToDecoratorFactory: {
    (optsOrType?: string | typeof JSORMBase | AssociationFactoryOpts<JSORMBase> | undefined): (target: JSORMBase, propertyKey: string) => void;
    (target: typeof JSORMBase, propertyKey: string, optsOrType?: string | AssociationFactoryOpts<JSORMBase> | undefined): void;
};
export { ModelDecorator as Model, AttrDecoratorFactory as Attr, HasManyDecoratorFactory as HasMany, HasOneDecoratorFactory as HasOne, BelongsToDecoratorFactory as BelongsTo };
