# Asteria Learn: the site, and a Swift runner for the exercises. Swift 6.4 on Ubuntu, with Node 24 added.
FROM swift:6.4.2-noble@sha256:bca121f6eb59fd80340d1296887b2698ed8f3eb9eca7d80c181f8af769dc7ee0

ARG TARGETARCH
ENV NODE_VERSION=24.22.2
RUN set -eu; \
    case "${TARGETARCH:-amd64}" in \
      amd64) arch=x64;   sum=48cc0e21e048790e54c0cf5749c2725005313d652651c40b7a21feb9697aaf75 ;; \
      arm64) arch=arm64; sum=eb187837a2230d4047161ac0be008584e16b46f726e9c9490ee35dc6b17d9ba8 ;; \
      *) echo "unsupported $TARGETARCH"; exit 1 ;; \
    esac; \
    apt-get update && apt-get install -y --no-install-recommends curl xz-utils ca-certificates && rm -rf /var/lib/apt/lists/*; \
    curl -fsSLo /tmp/node.tar.xz "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-${arch}.tar.xz"; \
    echo "$sum  /tmp/node.tar.xz" | sha256sum -c -; \
    tar -xJf /tmp/node.tar.xz -C /usr/local --strip-components=1 --exclude='*/include' --exclude='*/share'; \
    rm /tmp/node.tar.xz; node --version; swiftc --version

# Learners' code compiles and runs as this user, never as the server
RUN useradd --create-home --shell /usr/sbin/nologin runner && mkdir -p /data

WORKDIR /app
COPY server.mjs ./
COPY src/ src/
COPY curriculum/ curriculum/
COPY public/ public/
COPY LICENSE ./

# warm the compiler's caches so the first learner does not wait for them
RUN printf 'print("ready")\n' > /tmp/warm.swift && swiftc -swift-version 6 -default-isolation MainActor -o /tmp/warm /tmp/warm.swift && /tmp/warm && rm -f /tmp/warm /tmp/warm.swift

ENV NODE_ENV=production PORT=8080 DATA_DIR=/data RUNNER_USER=runner
EXPOSE 8080
CMD ["node", "server.mjs"]
