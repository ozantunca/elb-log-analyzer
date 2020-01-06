# Contributing

## How it currently works

The program keeps an array of top results at any given time. The size of the array is based on the `limit` setting in the configuration. The script goes through all files, reading through every line and `filter`ing and `sort`ing them based on the given configuration and then showing the final results.


```mermaid
graph TB;
  A[Start reading a file] --> B[Read a new line];
  B --> C[Apply filter]
  C -- pass --> D[Apply sort]
  C -- reject --> B
  D -- is higher than the last item in the results --> E[Insert in results]
  D -- is lower than the last item in the results --> B
```