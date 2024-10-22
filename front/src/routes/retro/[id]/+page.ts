import { getBoard } from "../../../services/getBoard";

export const ssr = false


export async function load({ params, parent }) {
  await parent()
  const board = await getBoard(params.id)
  console.log('board', board)
  return board
}
