class APIFeatures{

    constructor(query, queryString){
        this.query = query;
        this.queryString = queryString;
    }

    filter(){

        const queryObj = {...this.queryString};
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);
        
        let queryStr = JSON.stringify(queryObj);

        //127.0.0.1:3000/api/v1/tours?duration[gte]=5&difficulty=easy&price[lt]=1500
        //in this is what it should look like Tour.find({ duration: { '$gte': '5' },difficulty: 'easy',price: { '$lt': '1500' } })

        //we are using a regex to put a '$' sign in front of any gt or gte or lt or lte strings 
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);
        console.log(JSON.parse(queryStr));

        this.query = this.query.find(JSON.parse(queryStr));
        // let query = Tour.find(JSON.parse(queryStr));   
        return this;//we are returning this so we can chain multiple methods like this const features = new APIFeatures(Tour.find(), req.query).filter().sort();    
    }

    sort(){
        if (this.queryString.sort){
            //127.0.0.1:3000/api/v1/tours?sort=-price,ratingAverage
            const sortBy = this.queryString.sort.split(',').join(' ');//this is to get this - { sort: '-price ratingAverage' }
            console.log(`sortBy ${sortBy}`);
            //query.sort(req.query.sort);
            this.query = this.query.sort(sortBy);
        } else {
            //if no sort query param the sort by createdAt descending
            this.query = this.query.sort('-createdAt'); // '-' is for sorting by descending order            
        } 
        return this;//we are returning this so we can chain multiple methods like this const features = new APIFeatures(Tour.find(), req.query).filter().sort();    
    }

    limitFields(){
        if (this.queryString.fields){
            //127.0.0.1:3000/api/v1/tours?fields=name,price,duration,difficulty//to display only these fields
            const fields = this.queryString.fields.split(',').join(' ');//to get this { fields: 'name price duration difficulty' }
            console.log(`fields ${fields}`);
            
            this.query = this.query.select(fields);
        } else {
            //if no field query param the exclude the __v field '-' means exclude
            this.query = this.query.select('-__v');            
        } 
        return this;       
    }

    paginate(){
        const page = this.queryString.page * 1 || 1;//we are multiplying by 1 to turn the string value into a number
        
        // || 100 means a default value of 100
        const limit = this.queryString.limit * 1 || 100;//we are multiplying by 1 to turn the string value into a number
                
        const skip = (page - 1) * limit;

        //127.0.0.1:3000/api/v1/tours?page=2&limit=4 , IF WE HAVE LIMIT 10 then 1 to 10 (page 1), 11 to 20 (page 2), 21 to 30 (page 3)
        this.query = this.query.skip(skip).limit(limit);//skip - page number, limit - results per page
    
        return this;
    }
}

module.exports = APIFeatures;