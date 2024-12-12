# Use a minimal base image
FROM golang:1.23 AS builder

WORKDIR /app

# Copy go.mod first (caching dependencies)
COPY go.mod ./
RUN go mod download

# Copy the rest of the source code
COPY . .

# Build the Go application with static linking
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o redirector .

# Use a lightweight image for the final container
FROM alpine:3.21

WORKDIR /app

COPY --from=builder /app/redirector .

# Expose the port
EXPOSE 8080

# Command to run the app
CMD ["./redirector"]
