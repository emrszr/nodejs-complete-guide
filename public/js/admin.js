const deleteProduct = (btn) => {
  const productId = btn.parentNode.querySelector("[name=productId").value;
  const csrf = btn.parentNode.querySelector("[name=_csrf").value;

  const prdElem = btn.closest("article");

  fetch("/admin/product/" + productId, {
    method: "DELETE",
    headers: { "csrf-token": csrf },
  })
    .then((result) => {
      return result.json();
    })
    .then((data) => {
      console.log(data);
      prdElem.parentNode.removeChild(prdElem);
    })
    .catch((err) => console.log(err));
};
