import express from "express";

const app = express();

const categories = [
    {
        "id": 1,
        "name": "Pizzas",
        "description": "Pizzas tradicionais, especiais e sabores da casa."
    },
    {
        "id": 2,
        "name": "Bebidas",
        "description": "Refrigerantes, sucos, águas e outras bebidas para acompanhar a pizza."
    },
    {
        "id": 3,
        "name": "Sobremesas",
        "description": "Opções doces para finalizar a refeição, como pizzas doces e sobremesas."
    }
];

const products = [
    {
        "id": 1,
        "categoryId": 1,
        "name": "Pizza Margherita",
        "description": "Molho de tomate, mussarela, tomate e manjericão fresco.",
        "price": 39.90
    },
    {
        "id": 2,
        "categoryId": 1,
        "name": "Pizza Calabresa",
        "description": "Molho de tomate, mussarela, calabresa fatiada e cebola.",
        "price": 42.90
    },
    {
        "id": 3,
        "categoryId": 2,
        "name": "Coca-Cola 2L",
        "description": "Refrigerante Coca-Cola em garrafa de 2 litros.",
        "price": 12.00
    },
    {
        "id": 4,
        "categoryId": 3,
        "name": "Pizza de Chocolate",
        "description": "Pizza doce com chocolate cremoso e granulado.",
        "price": 36.90
    }
]


app.get("/", (req, res) => {
    res.status(200).json({
        message: "API Restaurante",
        version: "1.0.0"
    });
});

app.get("/categories", (req, res) => {
    res.status(200).json(categories);
});

app.get("/products", (req, res) => {
    res.status(200).json(products);
});

export default app;