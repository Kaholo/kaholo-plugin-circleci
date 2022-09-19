FROM docker:git

RUN apk update && apk add bash curl

RUN curl -fLSs https://circle.ci/cli | bash

RUN git config --global --add safe.directory '*'