const Joi=require('joi');  //for server side validations


module.exports.listingSchema=Joi.object({
  listings:Joi.object({
   title:Joi.string().required(),
  description:Joi.string().required(),
  location:Joi.string().required(),
  country:Joi.string().required(),
  price:Joi.number().required().min(0),
  image:Joi.string().allow("",null)
  }).required()
})
