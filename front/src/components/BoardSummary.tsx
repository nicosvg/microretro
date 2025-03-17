import React, { useState } from 'react';
import { Button, TextField, Box, Typography } from '@mui/material';
import { Board, BoardStep } from '@domain/board';

interface BoardSummaryProps {
    board: Board;
    onUpdateSummary: (summary: string) => Promise<void>;
    isEditable?: boolean;
}

export const BoardSummary: React.FC<BoardSummaryProps> = ({
    board,
    onUpdateSummary,
    isEditable = board.step === BoardStep.DISCUSS || board.step === BoardStep.DONE
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [summary, setSummary] = useState(board.summary || '');

    const handleSaveSummary = async () => {
        await onUpdateSummary(summary);
        setIsEditing(false);
    };

    if (!isEditable && !board.summary) {
        return null;
    }

    return (
        <Box sx={{ mt: 3, mb: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 1 }}>
            <Typography variant="h6" gutterBottom>
                Retrospective Summary
            </Typography>

            {isEditing ? (
                <>
                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        value={summary}
                        onChange={(e) => setSummary(e.target.value)}
                        placeholder="Add a summary of the retrospective..."
                        variant="outlined"
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                        <Button variant="outlined" onClick={() => setIsEditing(false)}>
                            Cancel
                        </Button>
                        <Button variant="contained" onClick={handleSaveSummary}>
                            Save
                        </Button>
                    </Box>
                </>
            ) : (
                <>
                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                        {board.summary || 'No summary has been added yet.'}
                    </Typography>
                    {isEditable && (
                        <Button
                            variant="outlined"
                            onClick={() => setIsEditing(true)}
                            sx={{ mt: 2 }}
                        >
                            {board.summary ? 'Edit Summary' : 'Add Summary'}
                        </Button>
                    )}
                </>
            )}
        </Box>
    );
};
