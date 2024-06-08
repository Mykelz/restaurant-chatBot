const express = require('express');
const { createServer } = require('http');
const path = require('path');
const { Server } = require('socket.io');

const app = express();

const server = createServer(app);
const io = new Server(server);

const meals = [
    { id: 2, name: 'pizza', price: 70 },
    {id: 4, name: 'jollof-rice', price: 100},
    {id: 6, name: 'ice-cream', price: 40},
    {id: 8, name: 'spaghetti', price: 70},
    {id: 10, name: 'noodles', price: 20},
]

const formatMealsAsHtmlList = (meals) => {
    let htmlList = '<ul style="list-style-type: none">';
    meals.forEach(meal => {
        htmlList += `<li>${meal.id} - ${meal.name} - ( $${meal.price} )</li>`;
    });
    htmlList += '</ul> <br/>';
    return htmlList;
};

app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))


app.get('/', (req, res)=>{
    res.sendFile(path.join(__dirname, 'public/views', 'index.html'));
})

const sessions = {}

io.on('connection', (socket) => {
    console.log('a user connected');

    const userId = socket.id
    if(!sessions[userId]){
        sessions[userId] = { currentOrder :[], orderHistory : []}
    }
    socket.on('disconnect', ()=>{
        console.log('user deisconnected')
    } )

    socket.on('message', (msg)=>{
        console.log(msg)
        
        let response;
        const session = sessions[userId]
        switch (msg) {
            case '1':
                console.log(session)
                res = '<p style="font-weight: bold;">Select the meal number to add to your order.</p> <br/>';
                res += `${formatMealsAsHtmlList(meals)}`;
                response = addInputToUI(false,res)
                break;
            case '99':
                if (session.currentOrder.length > 0) {
                    console.log(session.currentOrder)
                    session.orderHistory.push([...session.currentOrder]);
                    session.currentOrder = [];
                    res = '<p style="font-weight: bold;">Order placed successfully! would you like to place another order? <p/> <br/>';
                } else {
                    res = '<p style="font-weight: bold;">No order to place.<p/> <br/>';
                }
                res += getWelcomeMessage();
                response = addInputToUI(false, res)
                break;
            case '98':
                if(session.orderHistory.length > 0){
                    console.log(session.orderHistory)
                    function getOrderHistory(){
                        let htmlList = '<ul style="list-style-type: none"> <p> your oder history: <p/> <br/>';
                        session.orderHistory[0].forEach(order => {
                            htmlList += `<li style="font-weight: bold;">${order.name} - ( $${order.price} )</li>`;
                        });
                        htmlList += '</ul> <br/>';
                        return htmlList
                    }
                    res = getOrderHistory();
                }else{
                    res = '<p style="font-weight: bold;">No order history found.<p/> <br/>';
                }
                res += getWelcomeMessage()
                response = addInputToUI(false, res)
                break;
            case '97':
                if(session.currentOrder.length > 0){
                    res =`<p style="font-weight: bold;">Current Order: ${JSON.stringify(session.currentOrder)}<p/> <br/>`
                }else{
                    res = '<p style="font-weight: bold;">Your current order is empty.<p/> <br/>';
                }
                res += getWelcomeMessage()
                response = addInputToUI(false, res)
                break;
            case '0':
                if (session.currentOrder.length > 0) {
                    session.currentOrder = [];
                    res = '<p style="font-weight: bold;">Cancelled your current order.<p/> <br/>';
                } else {
                    res = '<p style="font-weight: bold;">No order to cancel.<p/> <br/>';
                }
                res += getWelcomeMessage()
                response = addInputToUI(false, res)
                break;
            default:
                const mealId = parseInt(msg);
                const meal = meals.find(m => m.id === mealId);
                if (meal) {
                    session.currentOrder.push(meal);
                    console.log(session.currentOrder)
                    res = `<p style="font-weight: bold;">${meal.name} added to your order. What would you like to do next?<p/> <br/>`;
                } else {
                    res = '<p style="font-weight: bold;">Invalid selection. Please try again.<p/> <br/>';
                }
                res += getWelcomeMessage()
                response = addInputToUI(false, res)
        }
        socket.emit('response', response)

      })
 
})


function getWelcomeMessage(){
  const message = 
    `<p id="message">
        Select [1] place an order <br/><br/>
        Select [99] to checkout order <br/><br/>
        Select [98] to see order history <br/><br/>
        Select [97] to see current order <br/><br/>
        Select [0] to cancel order <br/><br/>
     </p>`
  return message
}

function addInputToUI(isOwnMessage,data){
    const element =
      `<li class="${isOwnMessage ? "message-right": "message-left"}">
      <p id="message">
        ${data}
      </p>
      </li>`
  
      return element
  }


server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
    });   