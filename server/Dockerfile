FROM golang:1.23.0

WORKDIR /app

# Install Python
RUN apt-get update && apt-get install -y python3 python3-pip

# Set python alias if needed
RUN ln -s /usr/bin/python3 /usr/bin/python

COPY go.mod ./
COPY go.sum ./
RUN go mod download

COPY . .

RUN go build -o main .

CMD [ "./main" ]
