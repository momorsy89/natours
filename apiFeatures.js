class ApiFeatures {
    constructor(query,queryString) {
      this.query = query;
      this.queryString = queryString;
    }
    //filtering
    //basic filtering
    filter() {
      const queryObj = { ...this.queryString };
      const execludedFields = ["page", "limit", "sort", "fields"];
      execludedFields.forEach((el) => delete queryObj[el]);
      /////////////////////////////////
      // advanced filtering
      let strQuery = JSON.stringify(queryObj);
      strQuery = strQuery.replace(
        /\b(gte|gt|lte|lt)\b/g,
        (match) => `$${match}`
      );
      this.query.find(JSON.parse(strQuery));
      return this;
    }
    sort(){
      if (this.queryString.sort) {
        const sortBy = this.queryString.sort.split(",").join(" ");
        this.query = this.query.sort(sortBy);
      }
      return this;
    }
    project(){
      if (this.queryString.fields) {
        const fields = this.queryString.fields.split(",").join(" ");
        this.query = this.query.select(fields);
      }
      return this;
    }
    paginate(){
      const page = this.queryString.page * 1 || 1;
      const limit = this.queryString.limit * 1 || 100;
      const skip = (page - 1) * limit;
      this.query = this.query.skip(skip).limit(limit);
      return this;
  }}
  module.exports=ApiFeatures;