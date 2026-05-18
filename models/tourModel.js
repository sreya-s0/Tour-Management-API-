const mongoose = require('mongoose');
const slugify = require('slugify');
const validator = require('validator');
const User = require('./userModel');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour must have a name'],
      unique: true,
      trim: true,
      validate: {
        validator: function (val) {
          return validator.isAlpha(val, 'en-US', { ignore: ' ' });
        },
        message: 'Name can only contain letters',
      },
    },
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a max group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficullty'],
      enum: {
        values: ['difficult', 'easy', 'medium'],
        message: 'difficulty should be eaysy medium or hard',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must me minimum 1'],
      max: [5, 'Rating should not exceed 5'],
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'a tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: [
        function (val) {
          return val < this.price;
        },
        'Price discount {{VALUE}}should not be greater than price',
      ],
    },
    startLocation: {
      type: {
        // type of geospatial figure : point , any shapes
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number], //Array of points specifying lats and long respectively
      address: String,
      description: String,
    },

    locations: [
      {
        type: {
          // type of geospatial figure : point , any shapes
          type: String,
          default: 'Point',
          enum: ['Point'],
        },
        coordinates: [Number], //Array of points specifying lats and long respectively
        address: String,
        description: String,
        day: Number,
      },
    ],
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'A tour must have a description'],
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have an image cover'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
    },
    startDates: [Date],
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    guides: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

tourSchema.virtual('durationWeek').get(function () {
  //will not be available for use in query like Tour.find({durationwweek : 1})
  return (this.duration / 7).toPrecision(2);
});

//runs before .save() and .create() excluding .insertMany()
//can add multiple pre or post middleware use next()
//to execute multiple pre or post call next() if more than one pre or more than one post exists
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

// tourSchema.post('save', function (doc, next) {
//   console.log('Document: ', doc);
//   next();
// });

//query middleware

//executed before query is executed
//all strings that starts with find
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  this.start = Date.now();
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
    select: '-__v -passwordChangedAt',
  });
  next();
});

tourSchema.post(/^find/, function (doc, next) {
  console.log(`Query took ${Date.now() - this.start} millisec`);
  next();
});

//Aggregate Pipeline
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({ $match: { secretTour: { $ne: true } } });
  next();
});

// tourSchema.pre('save', async function (next) {
//   const guidePromises = this.guides.map(async (id) => await User.findById(id));
//   this.guides = await Promise.all(guidePromises);
//   next();
// });

const Tour = mongoose.model('Tour', tourSchema);

module.exports = Tour;
