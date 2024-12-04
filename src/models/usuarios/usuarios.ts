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
    const token = jwt.sign({ id: user.id }, process.env.TOKEN);

    return res.status(200).json({
        message: 'Login realizado com sucesso!',
        token
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


// export async function verificaToken(req,res,next){

//     const authHeaders = req.headers['authorization'];
    
//     const token = authHeaders && authHeaders.split(' ')[1]
//     //Bearer token
//     console.log("vendo se pode");
//     if(token == null) return res.status(401).send('Acesso Negado');
//     console.log(pode);
//     jwt.verify(token, process.env.TOKEN, (err) => {
//         if(err) return res.status(403).send('Token Inválido/Expirado');
//         next();
//     })

// }

export async function verificaToken(req, res, next) {
    console.log("Middleware verificaToken chamado");
    const authHeaders = req.headers['authorization'];
    console.log("Cabeçalho Authorization:", authHeaders);

    const token = authHeaders && authHeaders.split(' ')[1];
    console.log("Token extraído:", token);

    if (!token) {
        console.log("Nenhum token encontrado");
        return res.status(401).send('Acesso Negado');
    }

    jwt.verify(token, process.env.TOKEN, (err, decoded) => {
        if (err) {
            console.log("Erro na verificação do token:", err.message);
            return res.status(403).send('Token Inválido/Expirado');
        }
        console.log("Token válido, payload:", decoded);
        next();
    });
}