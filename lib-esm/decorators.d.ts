import { JSORMBase, ModelConfigurationOptions } from './model';
import { AttributeOptions } from './attribute';
import { AssociationFactoryOpts } from './associations';
declare type ModelDecorator = <M extends typeof JSORMBase>(target: M) => M;
declare function ModelDecorator(config?: ModelConfigurationOptions): ModelDecorator;
export declare function initModel(modelClass: typeof JSORMBase, config?: ModelConfigurationOptions): void;
declare function AttrDecoratorFactory(config?: AttributeOptions): PropertyDecorator;
declare function AttrDecoratorFactory(target: JSORMBase, propertyKey: string): void;
declare function AttrDecoratorFactory(target: typeof JSORMBase, propertyKey: string, config?: AttributeOptions): void;
declare const HasManyDecoratorFactory: {
    (target: typeof JSORMBase, propertyKey: string, optsOrType?: string | AssociationFactoryOpts<JSORMBase> | undefined): void;
    (optsOrType?: string | typeof JSORMBase | AssociationFactoryOpts<JSORMBase> | undefined): (target: JSORMBase, propertyKey: string) => void;
};
declare const HasOneDecoratorFactory: {
    (target: typeof JSORMBase, propertyKey: string, optsOrType?: string | AssociationFactoryOpts<JSORMBase> | undefined): void;
    (optsOrType?: string | typeof JSORMBase | AssociationFactoryOpts<JSORMBase> | undefined): (target: JSORMBase, propertyKey: string) => void;
};
declare const BelongsToDecoratorFactory: {
    (target: typeof JSORMBase, propertyKey: string, optsOrType?: string | AssociationFactoryOpts<JSORMBase> | undefined): void;
    (optsOrType?: string | typeof JSORMBase | AssociationFactoryOpts<JSORMBase> | undefined): (target: JSORMBase, propertyKey: string) => void;
};
export { ModelDecorator as Model, AttrDecoratorFactory as Attr, HasManyDecoratorFactory as HasMany, HasOneDecoratorFactory as HasOne, BelongsToDecoratorFactory as BelongsTo };
