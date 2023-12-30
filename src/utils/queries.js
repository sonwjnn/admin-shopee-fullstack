exports.getProductsQuery = (
  [priceMin, priceMax],
  [ratingMin, ratingMax],
  city = 'all'
) => {
  priceMin = Number(priceMin)
  priceMax = Number(priceMax)
  ratingMin = Number(ratingMin)
  ratingMax = Number(ratingMax)

  const priceFilter = priceMax
    ? { discountPrice: { $gte: priceMin, $lte: priceMax } }
    : {}
  const ratingFilter =
    ratingMin || ratingMax
      ? {
          averageRating: {
            $gte: ratingMin || 0,
            $lte: ratingMax || 5 // assuming rating range is from 0 to 5
          }
        }
      : {}

  const matchQuery = {
    // Add other conditions if needed
    // isActive: true,
    ...priceFilter,
    ...ratingFilter
  }

  const basicQuery = [
    {
      $lookup: {
        from: 'shops', // replace with your actual shop collection name
        localField: 'shopId',
        foreignField: '_id',
        as: 'shop'
      }
    },
    { $unwind: '$shop' },
    {
      $lookup: {
        from: 'reviews',
        localField: '_id',
        foreignField: 'productId',
        as: 'reviews'
      }
    },
    {
      $addFields: {
        totalRatings: { $sum: '$reviews.rating' },
        totalReviews: { $size: '$reviews' }
      }
    },
    {
      $addFields: {
        averageRating: {
          $cond: [
            { $eq: ['$totalReviews', 0] },
            0,
            { $divide: ['$totalRatings', '$totalReviews'] }
          ]
        }
      }
    },
    {
      $match: matchQuery
    },
    {
      $project: {
        reviews: 0
      }
    }
  ]

  if (city !== 'all') {
    basicQuery.splice(4, 0, {
      $match: {
        'shop.city': city
      }
    })
  }

  return basicQuery
}
