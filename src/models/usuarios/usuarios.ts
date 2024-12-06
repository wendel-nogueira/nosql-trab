import { Request, Response, NextFunction } from "express";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";
import { compareSync, hashSync } from "bcrypt";
import {
  BadRequestException,
  ConflictException,
  UnauthorizedException,
} from "../../utils/exceptions";
import { neo4jDriver } from "../../config/database";

const jwtSecret =
  "a9fd3c98f83c4b7f9192f8ae0d71b6b4b79e1de905b80b3da7c146890c504c3f";

export class UserController {
  async criarConta(req: Request, res: Response) {
    const prisma = new PrismaClient();

    const { name, email, password, cep, birthDate } = req.body;

    if (!name || !email || !password || !cep || !birthDate) {
      throw new BadRequestException("Todos os campos são obrigatórios!");
    }

    try {
      const existingUser = await prisma.usuario.findUnique({
        where: { email },
      });

      if (existingUser) {
        throw new ConflictException("E-mail já cadastrado!");
      }

      const newPass = hashSync(password, 10);

      const newUser = await prisma.usuario.create({
        data: {
          nome: name,
          email,
          senha: newPass,
          cep,
          data_nasc: new Date(birthDate),
        },
      });

      const session = neo4jDriver.session();

      await session.run(
        `CREATE (u:Usuario {id: $id, name: $name, email: $email})`,
        {
          id: newUser.id,
          name: newUser.nome,
          email: newUser.email,
        }
      );

      session.close();

      const token = jwt.sign(
        {
          id: newUser?.id,
          name: newUser?.nome,
          email: newUser?.email,
          cep: newUser?.cep,
          birthDate: newUser?.data_nasc,
        },
        jwtSecret,
        {
          expiresIn: "4h",
        }
      );

      return res.status(201).json({
        message: "Usuário registrado com sucesso!",
        token,
      });
    } catch (error) {
      console.log(error);
    }
  }

  async login(req: Request, res: Response) {
    const prisma = new PrismaClient();
    const { email, password } = req.body;

    if (!email || !password) {
      throw new BadRequestException("E-mail e senha são obrigatórios!");
    }

    const user = await prisma.usuario.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException("Credenciais inválidas!");
    }

    const senhaValida = compareSync(password, user.senha);

    if (!senhaValida) {
      throw new UnauthorizedException("Credenciais inválidas!");
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: user.nome,
        email: user.email,
        cep: user.cep,
        birthDate: user.data_nasc,
      },
      jwtSecret,
      {
        expiresIn: "4h",
      }
    );

    return res.status(200).json({
      message: "Login realizado com sucesso!",
      token,
    });
  }
}
