import mongoose from "mongoose";

export class BaseRepository<T> {
  public model: any;

  constructor(model: any) {
    this.model = model;
  }

  public async create(data: Partial<T>): Promise<T> {
    const doc = new this.model(data);
    const savedDoc = await doc.save();
    return savedDoc;
  }

  public async count(filter: any): Promise<number> {
    const totalCount = await this.model.countDocuments(filter);
    return totalCount;
  }

  public async findOne(key: string, value: string): Promise<T> {
    const doc = await this.model.findOne({ [key]: value });
    return doc;
  }

  public async findWithPagination(
    filter: any,
    skip: number,
    limit: number,
    sortOptions?: any,
    populateFields?: { path: string; select?: string }[]
  ) {
    let query = this.model
      .find(filter)
      .skip(skip)
      .limit(limit)
      .lean(); // 🔥 better performance

    // sorting
    if (sortOptions) {
      query = query.sort(sortOptions);
    } else {
      query = query.sort({ createdAt: -1 });
    }

    // ✅ populate support
    if (populateFields?.length) {
      populateFields.forEach((field) => {
        query = query.populate(field.path, field.select || "");
      });
    }

    let results = await query;

    // ✅ auto transform populated fields → { id, name }
    if (populateFields?.length) {
      results = this.mapIdNameFields(
        results,
        populateFields.map((f) => f.path)
      );
    }

    return results;
  }

  // 🔥 reusable transformer
  private mapIdNameFields(data: any[], fields: string[]) {
    return data.map((item) => {
      fields.forEach((field) => {
        if (item[field]) {
          item[field] = {
            id: item[field]._id,
            name: item[field].name,
          };
        }
      });
      return item;
    });
  }

  public async update(id: string, data: Partial<T>) {
    const updatedDoc = await this.model.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true },
    );
    return updatedDoc;
  }

  public async findById(id: string): Promise<T> {
    return this.model.findById(id);
  }

  public async findByFieldName(
    field: string,
    value: string | mongoose.Types.ObjectId,
  ): Promise<T> {
    const model = await this.model.find({
      [field]: value,
    });
    return model[0];
  }

  public async checkIfFieldAlreadyExists(
    field: string,
    value: string,
  ): Promise<boolean> {
    const alreadyExists = await this.model.exists({ [field]: value });

    return !!alreadyExists;
  }

  public async deleteById(id: string): Promise<T | null> {
    const deletedDoc = await this.model.findByIdAndDelete(id);
    return deletedDoc;
  }
}
