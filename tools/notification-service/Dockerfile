FROM golang:1.21-alpine AS builder

COPY . /app

WORKDIR /app

RUN go build -o notification .


FROM alpine

COPY --from=builder /app/notification /usr/local/bin/notification

ENTRYPOINT [ "/usr/local/bin/notification" ]
