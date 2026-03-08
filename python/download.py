import click
from download_album import download_album

@click.group()
def cli():
    pass

@cli.command()
@click.argument('id')
@click.option('--lyrics', type=click.Choice(['synced', 'plain', 'none'], case_sensitive=False), default='none')
def album(id, lyrics):
    download_album(id)
    

@cli.command()
@click.argument('id')
@click.option('--lyrics', type=click.Choice(['synced', 'plain', 'none'], case_sensitive=False), default='none')
def track(id, lyrics):
    click.echo(f"Downloading track {id} with lyrics: {lyrics}")

@cli.command()
@click.argument('id')
@click.option('--lyrics', type=click.Choice(['synced', 'plain', 'none'], case_sensitive=False), default='none')
def playlist(id, lyrics):
    click.echo(f"Downloading playlist {id} with lyrics: {lyrics}")

if __name__ == '__main__':
    cli()