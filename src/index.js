import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";

const app = express();

app.use(express.json());
app.use(cors());

const port = 6060;

app.listen(port, () => console.log(`Servidor inicializado na porta ${port}`));

// --------------------- TESTE DE ROTA -------------------------

app.get("/", (request, response) => {
  return response.status(200).json("Bem vindo à aplicação");
});

// --------------------- CRIAR USUÁRIO -------------------------

const users = [];

app.post("/signup", async (request, response) => {
  try {
    const { name, email, password } = request.body;

    if (!name) {
      return response
        .status(400)
        .json({ message: "Por favor, verifique se passou o nome" });
    }

    if (!email) {
      return response
        .status(400)
        .json({ message: "Por favor, verifique se passou o email" });
    }

    const checkEmail = users.find((user) => user.email === email);

    if (checkEmail) {
      return response
        .status(400)
        .json({ message: "Email já cadastrado, insira outro" });
    }

    if (!password) {
      return response
        .status(400)
        .json({ message: "Por favor, verifique se passou a senha" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      id: uuidv4(),
      name,
      email,
      password: hashedPassword,
    };

    users.push(newUser);

    response.status(201).json({
      message: `Seja bem vindo ${newUser.name}! Pessoa usuária cadastrada com sucesso!`,
    });
  } catch (error) {
    return response.status(400).json({ message: "Usuário já existe" });
  }
});

// --------------------- LOGIN -------------------------

app.post("/login", async (request, response) => {
  try {
    const { email, password } = request.body;

    if (!email) {
      return response.status(400).json({ message: "Insira um e-mail válido" });
    }

    if (!password) {
      return response.status(400).json({ message: "Insira um senha válida" });
    }

    const user = users.find((user) => user.email === email);

    if (!user) {
      return response.status(404).json({
        message:
          " Email não encontrado no sistema, verifique ou crie uma conta",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return response.status(400).json({ message: "Senha incorreta" });
    }

    response.status(200).json({
      message: `Seja bem vindo ${user.name}! Pessoa usuária logada com sucesso!`,
    });
  } catch (error) {
    response.status(500).json({ message: "Erro ao fazer login" });
  }
});

// --------------------- CRIAR MENSAGEM -------------------------

const messages = [];

app.post("/message", (request, response) => {
  const { email, title, description } = request.body;

  if (!title) {
    response
      .status(400)
      .json({ message: "Verifique se passou o título da mensagem" });
  }

  if (!description) {
    response
      .status(400)
      .json({ message: "Verifique se passou a descrição da mensagem" });
  }

  const checkLoggedUser = users.find((user) => user.email === email);

  if (!checkLoggedUser) {
    return response.status(404).json({
      message: " Email não encontrado no sistema, verifique ou crie uma conta",
    });
  }

  const newMessage = {
    id: uuidv4(),
    email,
    title,
    description,
  };

  messages.push(email, newMessage);

  response
    .status(201)
    .json({ message: "Mensagem criada com sucesso!", newMessage });
});

// --------------------- LER MENSAGEM -------------------------

app.post("/message/:email", (request, response) => {
  const { email } = request.params;

  const user = users.find((user) => user.email === email);

  if (!user) {
    return response
      .status(404)
      .json({ message: "Email não encontrado, verifique ou crie uma conta" });
  }
  
  const userMessages = messages.filter((user) => user.email === email);

  response.status(200).json({ message: "Seja bem vindo!", userMessages });
});

// --------------------- ATUALIZAR MENSAGEM -------------------------

app.put("/message/:id", (request, response) => {
  const { id } = request.params;

  const { title, description } = request.body;

  if (!title) {
    response
      .status(400)
      .json({ message: "Verifique se passou o título da mensagem" });
  }

  if (!description) {
    response
      .status(400)
      .json({ message: "Verifique se passou a descrição da mensagem" });
  }

  const updatedMessage = messages.find((msg) => msg.id === id);

  if (!updatedMessage) {
    return response
      .status(400)
      .json({ message: "Por favor, informe um id válido da mensagem" });
  }

  updatedMessage.title = title;
  updatedMessage.description = description;

  response.status(200).json({
    message: "Mensagem atualizada com sucesso!",
    update: updatedMessage,
  });
});

// ---------------------  DELETAR MENSAGEM -------------------------

app.delete("/message/:id", (request, response) => {
  const { id } = request.params;

  const idMessage = messages.findIndex((msg) => msg.id === id);

  if (idMessage === -1) {
    return response.status(404).json({
      message:
        "Mensagem não encontrada, verifique o identificador em nosso banco",
    });
  }

  const [deletedMessage] = messages.splice(idMessage, 1);

  response.status(200).json({
    message: "Mensagem apagada com sucesso",
    deleted: deletedMessage,
  });
});
