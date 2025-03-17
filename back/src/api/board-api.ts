// ...existing code...

router.put("/:boardId/summary", async (req, res) => {
    try {
        const { boardId } = req.params;
        const { summary } = req.body;

        // Update the summary in the database
        const updatedBoard = await db
            .update(boards)
            .set({ summary })
            .where(eq(boards.id, boardId))
            .returning();

        res.json(updatedBoard[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Failed to update board summary" });
    }
});

// ...existing code...
