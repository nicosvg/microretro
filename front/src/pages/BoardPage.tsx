import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { BoardStep } from '../constants';
import { getBoard } from '../services/boardService';
import { BoardSummary } from '../components/BoardSummary';
import { updateBoardSummary } from '../services/boardService';

const BoardPage = () => {
    const { boardId } = useParams();
    const [board, setBoard] = useState(null);

    useEffect(() => {
        const fetchBoard = async () => {