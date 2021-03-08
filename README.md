## service-config

```ts
{
  "localPathPrefix": string
}
```

## service-config

```ts
[
  {
    "name": string;
    "localPath": string;
    "script": string;
    "port": number;
    "podName": sreing;
    "order": number; // -1 the highest, 0 high, 1000 the lowest
    "group": string; // "common" | "dc"
  },  
]
```

