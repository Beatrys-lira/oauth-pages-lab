export async function consultarNotas(env, nome) {
  return env.DB.prepare(`SELECT * FROM notas WHERE aluno = '${nome}'`).all();
}
