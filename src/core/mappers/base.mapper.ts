// src/core/mappers/base.mapper.ts

export interface Mapper<TApi, TDomain, TView = TDomain> {
  toDomain(apiDto: TApi): TDomain;
  toView(domain: TDomain): TView;
  toApi(domain: TDomain): TApi;
  toDomainFromView(view: TView): TDomain;
}

export abstract class BaseMapper<TApi, TDomain, TView = TDomain> 
  implements Mapper<TApi, TDomain, TView> {
  
  abstract toDomain(apiDto: TApi): TDomain;
  abstract toView(domain: TDomain): TView;
  
  toApi(_domain: TDomain): TApi {
    throw new Error('Method not implemented');
  }
  
  toDomainFromView(_view: TView): TDomain {
    throw new Error('Method not implemented');
  }
}