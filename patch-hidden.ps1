$file = "c:\Users\alanso.mathew\jyothika\Internship Website\index.html"
$text = [System.IO.File]::ReadAllText($file, [System.Text.Encoding]::UTF8)

$lt   = [char]0x3C
$gt   = [char]0x3E
$quot = [char]0x22

# Add hidden attribute to countdown-unset-note so it doesn't flash on load
$old = $lt + "p class=" + $quot + "countdown-unset-note" + $quot + " id=" + $quot + "countdown-unset-note" + $quot + $gt
$new = $lt + "p class=" + $quot + "countdown-unset-note" + $quot + " id=" + $quot + "countdown-unset-note" + $quot + " hidden" + $gt

if ($text.Contains($old)) {
    $text = $text.Replace($old, $new)
    [System.IO.File]::WriteAllText($file, $text, [System.Text.Encoding]::UTF8)
    Write-Host "hidden attribute added: OK"
} else {
    Write-Host "NOT FOUND"
}
