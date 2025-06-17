# generate dockerfile for this bun app

# Use the official Bun image
FROM oven/bun:latest

# Set the working directory
WORKDIR /app

# Copy package.json and bun.lockb files
COPY back/package.json back/bun.lockb back/.

WORKDIR back
# Install dependencies
RUN bun install

# Copy the rest of the application code
COPY ../. ../.

# Run migrations
RUN bun run migrate

# Expose the port the app runs on
EXPOSE 3000
EXPOSE 3001

# Command to run the application
CMD ["bun", "run", "start"]

