import { getBoard } from "../../../services/getBoard";

/** @type {import('./$types').PageLoad} */
export async function load({ params }) {
  const board = await getBoard(params.id)
  console.log('board', board)
  return board
}
