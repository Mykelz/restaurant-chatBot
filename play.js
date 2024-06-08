 const meals = [ 
    [
    {name: "jollof", price: 500},
    {name: "pizza", price: 100},
    {name: "burger", price: 50}
    ],
    [
    {name: "pizza", price: 100},
    {name: "burger", price: 50}
    ],
    [
     {name: "burger", price: 50}
    ]
]


const totalPrice = meals.reduce((acc, category) => {
    const categoryTotal = category.reduce((categoryAcc, meal) => {
        console.log(categoryAcc, meal.price)
      return categoryAcc + meal.price;
    }, 0);
    console.log(acc,categoryTotal )
    return acc + categoryTotal;
  }, 0);

console.log(totalPrice);