import { 
  PartApiDto, 
  PartPropertiesApiDto,
  PartCategoryApiDto,
  PartCategoryPageApiDto,
  PartNameApiDto,
  PartListRequestDto
} from '../types/dto.types';
import { 
  Part
} from '../types/domain.types';
import { 
  PartViewModel, 
  PartCategoryViewModel, 
  PartCategoryPageViewModel,
  PartNameViewModel,
  PartFilters
} from '../types/view.types';

export class PartMapper {
  static toDomain(dto: PartApiDto): Part {
    return {
      id: dto.id,
      name: {
        value: dto.name,
        english: dto.englishTitle,
      },
      description: dto.description,
      category: {
        id: dto.partCategoryId,
        name: dto.partCategoryName,
        englishTitle: dto.partCategoryEnglishTitle,
        description: '',
        hasSeo: false,
        hasDescription: false,
      },
      brand: {
        id: dto.brandId,
        name: dto.brandName,
      },
      carModel: dto.carModel,
      carIds: dto.carIds,
      properties: [],
      metadata: {
        createdAt: new Date(dto.createdAt),
        updatedAt: new Date(dto.updatedAt),
      },
      isActive: dto.isActive,
    };
  }

  static toView(domain: Part, properties: PartPropertiesApiDto[] = []): PartViewModel {
    const formattedProperties = properties.map(p => ({
      key: p.propertyKey,
      value: p.propertyValue,
      displayOrder: p.displayOrder,
    }));

    return {
      id: domain.id,
      name: domain.name.value,
      englishTitle: domain.name.english,
      description: domain.description,
      category: {
        id: domain.category.id,
        name: domain.category.name,
        englishTitle: domain.category.englishTitle,
      },
      brand: {
        id: domain.brand.id,
        name: domain.brand.name,
        englishTitle: domain.brand.englishTitle,
      },
      carModel: domain.carModel,
      carIds: domain.carIds,
      image: null,
      properties: formattedProperties,
      metadata: {
        createdAt: domain.metadata.createdAt.toISOString(),
        updatedAt: domain.metadata.updatedAt.toISOString(),
      },
      isActive: domain.isActive,
    };
  }

  static toViewCategory(dto: PartCategoryApiDto): PartCategoryViewModel {
    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      description: dto.description,
      parentId: dto.parentId || null,
      hasSeo: dto.hasSeo,
      hasDescription: dto.hasDescription,
      children: dto.children ? dto.children.map(c => this.toViewCategory(c)) : [],
      createdAt: dto.createdAt,
      updatedAt: dto.updatedAt,
    };
  }

  static toViewCategoryPage(dto: PartCategoryPageApiDto): PartCategoryPageViewModel {
    const category = this.toViewCategory({
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      description: dto.description,
      hasSeo: false,
      hasDescription: false,
      isActive: true,
      isDeleted: false,
      children: dto.children || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const parts = (dto.parts || []).map(p => {
      const domain = this.toDomain(p);
      return this.toView(domain);
    });

    return {
      category,
      parts,
      totalParts: parts.length,
      breadCrumbs: dto.breadCrumbs || [],
    };
  }

  static toViewName(dto: PartNameApiDto): PartNameViewModel {
    return {
      id: dto.id,
      name: dto.name,
      englishTitle: dto.englishTitle,
      brandName: dto.brandName,
      carModel: dto.carModel,
      displayName: `${dto.brandName} - ${dto.name} (${dto.carModel})`,
    };
  }

  static toDomainRequest(request: PartFilters): PartListRequestDto {
    return {
      id: request.id,
      name: request.name,
      englishTitle: request.englishTitle,
      partCategoryEnglishTitle: request.partCategoryEnglishTitle,
      partCategoryId: request.partCategoryId,
      carModel: request.carModel,
      pageNumber: request.pageNumber || 1,
      pageSize: request.pageSize || 30,
    };
  }

  static formatCategoryTree(categories: PartCategoryViewModel[]): PartCategoryViewModel[] {
    const categoryMap = new Map<string, PartCategoryViewModel>();
    const rootCategories: PartCategoryViewModel[] = [];

    categories.forEach(cat => {
      categoryMap.set(cat.id, { ...cat, children: [] });
    });

    categories.forEach(cat => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        const parent = categoryMap.get(cat.parentId)!;
        if (!parent.children) parent.children = [];
        parent.children.push(node);
      } else {
        rootCategories.push(node);
      }
    });

    return rootCategories;
  }
}