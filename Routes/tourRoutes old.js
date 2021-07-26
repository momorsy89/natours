// in this file we use json to handel req & res

const fs=require('fs');
const express =require('express');
//Routers
const router=express.Router();

//converting json file to js array
const tours=JSON.parse(fs.readFileSync('./app-doc/tours-simple.json'));

//check if the id is valid

checkId=(req,res,next,val)=>{
    if(req.params.id*1>tours.length){
        return res.status(404).json({
            sataus:'faild',
            message:'invalid id'
        })
    }
    next();
};
router.param('id',checkId);

// check if the req.body is valid or not

checkBody=(req,res,next)=>{
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status:'faild',
            message:'missing name or price'
        })
    }
    next();
}

//get all tours
router.get('/',(req,res)=>{
    res.status(200).json({
        status:'success',
        result:tours.length,
        data:{tours}
    });
})


//get tour by id
router.get('/:id',(req,res)=>{
    const id=req.params.id*1;
    const tour =tours.find(el=>el.id===id)
    res.status(200).json({
        status:'success',
        data:{tour}
    });
})

//add new tour
router.post('/',(req,res)=>{
    if(!req.body.name || !req.body.price){
        return res.status(400).json({
            status:'faild',
            message:'missing name or price'
        })
    }
    const newId=tours.length+1;
    const newTour=Object.assign({id:newId},req.body);
    tours.push(newTour);
    fs.writeFile('./app-doc/tours-simple.json',JSON.stringify(tours),err=>{
        res.status(201).json({
            status:'success',
            data:{tour:newTour}
        })
    })
})

//update a tour
router.patch('/:id',(req,res)=>{
    res.status(200).json({
        status:'success',
        data:{tour:'<new tour details>'}
    });
})

//delete a tour
router.delete('/:id',(req,res)=>{
    res.status(204).json({
        status:'success',
        data:null
    });
})

module.exports=router;