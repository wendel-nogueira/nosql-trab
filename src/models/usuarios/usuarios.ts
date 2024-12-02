
import { PrismaClient } from "@prisma/client";
import fs from "fs";
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

export async function login(req, res) {
    const prisma = new PrismaClient();
    try {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email e senha são obrigatórios!' });
    }
    const user = await prisma.usuario.findUnique({
        where: { email },
    });

    if (!user) {
        return res.status(401).json({ message: 'Credenciais inválidas!' });
    }
    const passwordValidado = await bcrypt.compare(password, user.senha);
    if(!passwordValidado){ 
        return res.status(401).json({ message: 'Dados incorretos!' });
    }
    return res.status(200).json({
        message: 'Login realizado com sucesso!'
    });
    }catch (error) {
        console.error("Erro ao executar operação no Prisma:", error);
      } finally {
        await prisma.$disconnect();
      }

}


export async function criarConta(req, res) {
    const prisma = new PrismaClient();
    try {
        console.log("Conectado ao SQL");

        const { name, email, password, birthDate} = req.body;

        if (!name || !email || !password || !birthDate) {
            return res.status(400).json({ message: 'Todos os campos são obrigatórios!' });
        }

        const existingUser = await prisma.usuario.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(409).json({ message: 'E-mail já cadastrado!' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordCrypt = await bcrypt.hash(password,salt);

        const newUser = await prisma.usuario.create({
            data: {
                nome: name,
                email: email,
                senha: passwordCrypt, // Salvar a senha como hash
                cep: "0000000", //não tinha no front, depois eu coloco?
                data_nasc: new Date(birthDate),
            },
        });
        const users = await prisma.usuario.findMany(); // só pra ver se ta indo eles
        console.log("Lista de usuários:", users);
        return res.status(201).json({ message: 'Usuário registrado com sucesso!', user: newUser });

        
        } catch (error) {
          console.error("Erro ao executar operação no Prisma:", error);
        } finally {
          await prisma.$disconnect();
        }
      
}