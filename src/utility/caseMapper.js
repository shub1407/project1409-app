// utils/caseMapper.js

function camelizeKey(key) {
  return key.replace(/_([a-z])/g, (_, char) => char.toUpperCase())
}

function snakifyKey(key) {
  return key.replace(/([A-Z])/g, "_$1").toLowerCase()
}

export function toCamelCase(input) {
  if (Array.isArray(input)) {
    return input.map((item) => toCamelCase(item))
  }

  if (input && typeof input === "object" && !(input instanceof Date)) {
    const newObj = {}
    for (const key in input) {
      const camelKey = camelizeKey(key)
      newObj[camelKey] = toCamelCase(input[key]) // recursive call
    }
    return newObj
  }

  return input // primitive values
}

export function toSnakeCase(input) {
  if (Array.isArray(input)) {
    return input.map((item) => toSnakeCase(item))
  }

  if (input && typeof input === "object" && !(input instanceof Date)) {
    const newObj = {}
    for (const key in input) {
      const snakeKey = snakifyKey(key)
      newObj[snakeKey] = toSnakeCase(input[key]) // recursive call
    }
    return newObj
  }

  return input // primitive values
}
