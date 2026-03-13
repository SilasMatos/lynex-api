# Stage 1: Build dependencies
FROM oven/bun:latest AS builder
WORKDIR /app
COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

# Stage 2: Runtime
FROM oven/bun:latest
WORKDIR /app

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy application code
COPY . .

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s --retries=3 \
    CMD bun run --no-install -e "const res = await fetch('http://localhost:3000'); process.exit(res.ok ? 0 : 1)" || exit 1

# Run migrations and start the server
CMD ["bun", "run", "start"]
